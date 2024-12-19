"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative h-10 w-10 rounded-full bg-muted", className)} {...props} />
  )
)
Avatar.displayName = "Avatar"

export const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn("h-full w-full rounded-full object-cover", className)} {...props} />
  )
)
AvatarImage.displayName = "AvatarImage"

export const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />
  )
)
AvatarFallback.displayName = "AvatarFallback"
