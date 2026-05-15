package com.assignment.segroup.dto;

public class TeacherStatsResponse {

    private long totalTeachers;
    private long activeTeachers;
    private long inactiveTeachers;
    private long onLeaveTeachers;

    public TeacherStatsResponse(long totalTeachers, long activeTeachers, long inactiveTeachers, long onLeaveTeachers) {
        this.totalTeachers = totalTeachers;
        this.activeTeachers = activeTeachers;
        this.inactiveTeachers = inactiveTeachers;
        this.onLeaveTeachers = onLeaveTeachers;
    }

    public long getTotalTeachers() { return totalTeachers; }
    public long getActiveTeachers() { return activeTeachers; }
    public long getInactiveTeachers() { return inactiveTeachers; }
    public long getOnLeaveTeachers() { return onLeaveTeachers; }
}
