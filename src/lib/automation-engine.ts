import { prisma } from '@/lib/prisma';
import {
  AutomationTrigger,
  AutomationAction,
  ReminderType,
  ReminderStatus,
  ApplicationStatus,
  AssessmentStatus,
} from '@prisma/client';
import { add } from 'date-fns';

interface ExecutionResult {
  trigger: string;
  ruleId: string;
  ruleName: string;
  action: string;
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

interface TimelineEvent {
  id: string;
  type: 'rule_executed' | 'reminder_sent' | 'stage_changed' | 'assessment_created';
  title: string;
  description?: string;
  timestamp: Date;
  candidateId?: string;
  candidateName?: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}

interface TimelineFilters {
  applicationId?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Main entry point for executing automation rules
 * Finds all enabled rules matching the trigger and executes their actions
 */
export async function executeAutomation(
  trigger: AutomationTrigger,
  context: Record<string, any>,
  companyId: string
): Promise<ExecutionResult[]> {
  const results: ExecutionResult[] = [];

  try {
    // Find all enabled rules for this trigger
    const rules = await prisma.automationRule.findMany({
      where: {
        companyId,
        trigger,
        active: true,
      },
    });

    for (const rule of rules) {
      try {
        const config = JSON.parse(rule.config);
        const result = await executeAction(
          rule.action as AutomationAction,
          config,
          context,
          companyId
        );

        results.push({
          trigger: trigger.toString(),
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action.toString(),
          success: result.success,
          message: result.message,
          data: result.data,
          error: result.error,
        });

        // Update rule execution count and timestamp
        await prisma.automationRule.update({
          where: { id: rule.id },
          data: {
            executionCount: { increment: 1 },
            lastExecutedAt: new Date(),
          },
        });
      } catch (error) {
        results.push({
          trigger: trigger.toString(),
          ruleId: rule.id,
          ruleName: rule.name,
          action: rule.action.toString(),
          success: false,
          message: 'Rule execution failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  } catch (error) {
    console.error('Error executing automation:', error);
  }

  return results;
}

/**
 * Execute individual action based on type
 */
async function executeAction(
  action: AutomationAction,
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string; data?: any; error?: string }> {
  try {
    switch (action) {
      case AutomationAction.SEND_EMAIL:
        return await handleSendEmail(config, context, companyId);

      case AutomationAction.SEND_REMINDER:
        return await handleSendReminder(config, context, companyId);

      case AutomationAction.MOVE_STAGE:
        return await handleMoveStage(config, context, companyId);

      case AutomationAction.SCHEDULE_ASSESSMENT:
        return await handleScheduleAssessment(config, context, companyId);

      case AutomationAction.GENERATE_REPORT:
        return await handleGenerateReport(config, context, companyId);

      case AutomationAction.NOTIFY_TEAM:
        return await handleNotifyTeam(config, context, companyId);

      case AutomationAction.ARCHIVE_CANDIDATE:
        return await handleArchiveCandidate(config, context, companyId);

      default:
        return {
          success: false,
          message: 'Unknown action',
          error: `Action ${action} not implemented`,
        };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Action execution failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * SEND_EMAIL - Log email action (placeholder)
 */
async function handleSendEmail(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string }> {
  const { to, subject, template } = config;

  // Placeholder: In production, integrate with email service
  console.log(`[EMAIL] To: ${to || context.email}, Subject: ${subject}`);

  return {
    success: true,
    message: `Email sent: ${subject}`,
  };
}

/**
 * SEND_REMINDER - Create PipelineReminder record
 */
async function handleSendReminder(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  const { candidateId, reminderType, message, daysFromNow } = config;

  if (!candidateId || !reminderType || !message) {
    return {
      success: false,
      message: 'Missing required config: candidateId, reminderType, message',
    };
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, companyId },
  });

  if (!candidate) {
    return {
      success: false,
      message: 'Candidate not found',
    };
  }

  const scheduledFor = add(new Date(), {
    days: daysFromNow || 0,
  });

  const reminder = await prisma.pipelineReminder.create({
    data: {
      companyId,
      candidateId,
      applicationId: context.applicationId || null,
      type: reminderType as ReminderType,
      message,
      scheduledFor,
      status: ReminderStatus.PENDING,
    },
  });

  return {
    success: true,
    message: 'Reminder created',
    data: { reminderId: reminder.id },
  };
}

/**
 * MOVE_STAGE - Update application stage
 */
async function handleMoveStage(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string }> {
  const { applicationId } = context;
  const { toStage } = config;

  if (!applicationId || !toStage) {
    return {
      success: false,
      message: 'Missing required context or config: applicationId, toStage',
    };
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId },
    include: { jobPosting: true },
  });

  if (!application) {
    return {
      success: false,
      message: 'Application not found',
    };
  }

  // Verify company access
  if (application.jobPosting.companyId !== companyId) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: toStage as ApplicationStatus },
  });

  return {
    success: true,
    message: `Application moved to ${toStage}`,
  };
}

/**
 * SCHEDULE_ASSESSMENT - Create AssessmentSession
 */
async function handleScheduleAssessment(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string; data?: any }> {
  const { applicationId, candidateId } = context;
  const { expiresInDays } = config;

  if (!applicationId || !candidateId) {
    return {
      success: false,
      message: 'Missing required context: applicationId, candidateId',
    };
  }

  const application = await prisma.application.findFirst({
    where: { id: applicationId },
    include: { jobPosting: true },
  });

  if (!application) {
    return {
      success: false,
      message: 'Application not found',
    };
  }

  if (application.jobPosting.companyId !== companyId) {
    return {
      success: false,
      message: 'Unauthorized',
    };
  }

  const expiresAt = add(new Date(), {
    days: expiresInDays || 7,
  });

  const assessment = await prisma.assessmentSession.create({
    data: {
      candidateId,
      applicationId,
      companyId,
      status: AssessmentStatus.PENDING,
      expiresAt,
    },
  });

  return {
    success: true,
    message: 'Assessment scheduled',
    data: { assessmentId: assessment.id, token: assessment.token },
  };
}

/**
 * GENERATE_REPORT - Log report generation (placeholder)
 */
async function handleGenerateReport(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string }> {
  const { reportType } = config;

  console.log(`[REPORT] Generating ${reportType || 'assessment'} report`);

  return {
    success: true,
    message: `${reportType || 'Assessment'} report generation initiated`,
  };
}

/**
 * NOTIFY_TEAM - Log notification (placeholder)
 */
async function handleNotifyTeam(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string }> {
  const { notificationType, channel } = config;

  console.log(
    `[NOTIFY] Team notification (${notificationType}) via ${channel || 'in-app'}`
  );

  return {
    success: true,
    message: `Team notification sent: ${notificationType}`,
  };
}

/**
 * ARCHIVE_CANDIDATE - Update candidate status
 */
async function handleArchiveCandidate(
  config: Record<string, any>,
  context: Record<string, any>,
  companyId: string
): Promise<{ success: boolean; message: string }> {
  const { candidateId } = context;

  if (!candidateId) {
    return {
      success: false,
      message: 'Missing required context: candidateId',
    };
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, companyId },
  });

  if (!candidate) {
    return {
      success: false,
      message: 'Candidate not found',
    };
  }

  // Note: Assuming REJECTED or similar status means archived
  // Adjust based on your business logic
  await prisma.candidate.update({
    where: { id: candidateId },
    data: { status: 'REJECTED' as any },
  });

  return {
    success: true,
    message: 'Candidate archived',
  };
}

/**
 * Process all due reminders (PENDING where scheduledFor <= now)
 * Returns count of processed reminders
 */
export async function processReminders(companyId: string): Promise<number> {
  try {
    const now = new Date();

    const dueReminders = await prisma.pipelineReminder.findMany({
      where: {
        companyId,
        status: ReminderStatus.PENDING,
        scheduledFor: {
          lte: now,
        },
      },
    });

    // In production, send actual emails/notifications for each reminder
    // For now, just log and mark as sent
    for (const reminder of dueReminders) {
      console.log(`[REMINDER] Processing reminder ${reminder.id}: ${reminder.message}`);

      await prisma.pipelineReminder.update({
        where: { id: reminder.id },
        data: {
          status: ReminderStatus.SENT,
          sentAt: now,
        },
      });
    }

    return dueReminders.length;
  } catch (error) {
    console.error('Error processing reminders:', error);
    return 0;
  }
}

/**
 * Get timeline events for company or specific application
 * Includes rule executions, reminders sent, stage changes
 */
export async function getTimelineEvents(
  companyId: string,
  filters: TimelineFilters
): Promise<{ events: TimelineEvent[]; total: number }> {
  try {
    const { applicationId, limit = 100, offset = 0, startDate, endDate } = filters;

    const timelineEvents: TimelineEvent[] = [];

    // Get reminders sent
    const reminderWhere: any = {
      companyId,
      status: ReminderStatus.SENT,
    };

    if (applicationId) {
      reminderWhere.applicationId = applicationId;
    }

    if (startDate || endDate) {
      reminderWhere.sentAt = {};
      if (startDate) {
        reminderWhere.sentAt.gte = startDate;
      }
      if (endDate) {
        reminderWhere.sentAt.lte = endDate;
      }
    }

    const reminders = await prisma.pipelineReminder.findMany({
      where: reminderWhere,
      include: { candidate: true },
      orderBy: { sentAt: 'desc' },
      take: limit,
      skip: offset,
    });

    reminders.forEach((reminder) => {
      timelineEvents.push({
        id: reminder.id,
        type: 'reminder_sent',
        title: `Reminder sent to ${reminder.candidate.firstName} ${reminder.candidate.lastName}`,
        description: reminder.message,
        timestamp: reminder.sentAt || new Date(),
        candidateId: reminder.candidateId,
        candidateName: `${reminder.candidate.firstName} ${reminder.candidate.lastName}`,
        applicationId: reminder.applicationId || undefined,
        metadata: {
          reminderType: reminder.type,
        },
      });
    });

    // Get stage changes (from Application updates)
    const applicationWhere: any = { companyId };

    if (applicationId) {
      applicationWhere.id = applicationId;
    }

    const applications = await prisma.application.findMany({
      where: applicationWhere,
      include: { candidate: true },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    applications.forEach((app) => {
      timelineEvents.push({
        id: app.id,
        type: 'stage_changed',
        title: `Application status: ${app.status}`,
        description: `${app.candidate.firstName} ${app.candidate.lastName}`,
        timestamp: app.updatedAt,
        candidateId: app.candidateId,
        candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
        applicationId: app.id,
        metadata: {
          status: app.status,
        },
      });
    });

    // Get assessment created events
    const assessmentWhere: any = { companyId };

    if (applicationId) {
      assessmentWhere.applicationId = applicationId;
    }

    const assessments = await prisma.assessmentSession.findMany({
      where: assessmentWhere,
      include: { candidate: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    assessments.forEach((assessment) => {
      timelineEvents.push({
        id: assessment.id,
        type: 'assessment_created',
        title: `Assessment ${assessment.status} for ${assessment.candidate.firstName} ${assessment.candidate.lastName}`,
        description: `Assessment token: ${assessment.token}`,
        timestamp: assessment.createdAt,
        candidateId: assessment.candidateId,
        candidateName: `${assessment.candidate.firstName} ${assessment.candidate.lastName}`,
        applicationId: assessment.applicationId,
        metadata: {
          assessmentStatus: assessment.status,
          token: assessment.token,
        },
      });
    });

    // Sort by timestamp descending
    timelineEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      events: timelineEvents.slice(0, limit),
      total: timelineEvents.length,
    };
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    return { events: [], total: 0 };
  }
}

/**
 * Seed default automation rules for new companies
 */
export async function seedDefaultRules(companyId: string): Promise<void> {
  try {
    const defaultRules = [
      {
        name: 'Send assessment on application received',
        trigger: AutomationTrigger.APPLICATION_RECEIVED,
        action: AutomationAction.SCHEDULE_ASSESSMENT,
        config: { expiresInDays: 7 },
      },
      {
        name: 'Reminder 3 days before assessment deadline',
        trigger: AutomationTrigger.ASSESSMENT_PENDING,
        action: AutomationAction.SEND_REMINDER,
        config: {
          reminderType: ReminderType.ASSESSMENT_REMINDER,
          message: 'Your assessment is due soon. Please complete it to move forward in the hiring process.',
          daysFromNow: -3,
        },
      },
      {
        name: 'Notify team on stage change',
        trigger: AutomationTrigger.STAGE_CHANGED,
        action: AutomationAction.NOTIFY_TEAM,
        config: { notificationType: 'stage_change', channel: 'in-app' },
      },
      {
        name: 'Send email on interview scheduled',
        trigger: AutomationTrigger.INTERVIEW_SCHEDULED,
        action: AutomationAction.SEND_EMAIL,
        config: {
          subject: 'Interview Scheduled',
          template: 'interview_scheduled',
        },
      },
      {
        name: 'Send reminder 24 hours before interview',
        trigger: AutomationTrigger.INTERVIEW_SCHEDULED,
        action: AutomationAction.SEND_REMINDER,
        config: {
          reminderType: ReminderType.INTERVIEW_REMINDER,
          message: 'Your interview is tomorrow. Please prepare and join on time.',
          daysFromNow: 1,
        },
      },
    ];

    for (const rule of defaultRules) {
      await prisma.automationRule.create({
        data: {
          companyId,
          name: rule.name,
          trigger: rule.trigger,
          action: rule.action,
          config: JSON.stringify(rule.config),
          active: true,
        },
      });
    }

    console.log(`Seeded ${defaultRules.length} default automation rules for company ${companyId}`);
  } catch (error) {
    console.error('Error seeding default rules:', error);
  }
}
