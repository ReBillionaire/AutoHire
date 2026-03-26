"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

import { Search } from "lucide-react"

export interface CommandProps
  extends React.HTMLAttributes<HTMLDivElement> {
  shouldFilter?: boolean
}

export const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, shouldFilter, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50",
        className
      )}
      {...props}
      cmdk-root=""
    />
  )
)
Command.displayName = "Command"

export interface CommandInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput = React.forwardRef<
  HTMLInputElement,
  CommandInputProps
>(({ className, ...props }, ref) => (
  <div
    className="flex items-center border-b border-slate-200 px-3 dark:border-slate-800"
    cmdk-input-wrapper=""
  >
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-slate-400",
        className
      )}
      {...props}
      cmdk-input=""
    />
  </div>
))
CommandInput.displayName = "CommandInput"

export interface CommandListProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandList = React.forwardRef<
  HTMLDivElement,
  CommandListProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    cmdk-list=""
    {...props}
  />
))
CommandList.displayName = "CommandList"

export interface CommandEmptyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandEmpty = React.forwardRef<
  HTMLDivElement,
  CommandEmptyProps
>(({ ...props }, ref) => (
  <div
    ref={ref}
    className="py-6 text-center text-sm"
    cmdk-empty=""
    {...props}
  />
))
CommandEmpty.displayName = "CommandEmpty"

export interface CommandGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode
}

export const CommandGroup = React.forwardRef<
  HTMLDivElement,
  CommandGroupProps
>(({ className, heading, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("overflow-hidden p-1.5 text-slate-950 dark:text-slate-50", className)}
    cmdk-group=""
    {...props}
  >
    {heading && (
      <div
        className="overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400"
        cmdk-group-heading=""
      >
        {heading}
      </div>
    )}
    <div role="group" cmdk-group-items="">
      {props.children}
    </div>
  </div>
))
CommandGroup.displayName = "CommandGroup"

export interface CommandItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean
}

export const CommandItem = React.forwardRef<
  HTMLDivElement,
  CommandItemProps
>(
  (
    { className, value, onSelect, disabled, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-slate-800",
        disabled ? "pointer-events-none opacity-50" : "hover:bg-slate-100 dark:hover:bg-slate-800",
        className
      )}
      data-disabled={disabled}
      cmdk-item=""
      {...props}
    />
  )
)
CommandItem.displayName = "CommandItem"

export interface CommandSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 h-px bg-slate-200 dark:bg-slate-800", className)}
    cmdk-separator=""
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"

export interface CommandShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const CommandShortcut = ({
  className,
  ...props
}: CommandShortcutProps) => (
  <span
    className={cn(
      "ml-auto text-xs tracking-widest text-slate-500 dark:text-slate-400",
      className
    )}
    {...props}
  />
)
CommandShortcut.displayName = "CommandShortcut"
