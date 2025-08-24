# Instructor Schedule System

## Purpose

The instructor schedule system manages when instructors are available to teach classes. It provides a structured way to define recurring weekly schedules, handle schedule changes over time, and calculate specific available time slots for any given date range.

## Models

- InstructorSchedule: Defines time periods when a schedule is effective (e.g., "March 1, 2020 - April 30, 2025")
- InstructorSlot: Defines weekly recurring time slots within a schedule (e.g., "18:00 on Monday")
- InstructorAbsence: Marks specific date-times when instructor is unavailable (e.g., "March 15, 18:00")

## Availability Calculation

1. `InstructorSchedule` + `InstructorSlot` work as templates for recurring weekly patterns
2. Generates actual date-time slots from these templates for any given date range
3. `InstructorAbsence` entries are subtracted from the generated slots to get final availability
