package com.assignment.segroup.dto;

public class StudentStatsResponse {

    private long totalStudents;
    private long activeStudents;
    private long inactiveStudents;
    private long transferredStudents;
    private long graduatedStudents;

    public StudentStatsResponse(long totalStudents, long activeStudents, long inactiveStudents,
                                long transferredStudents, long graduatedStudents) {
        this.totalStudents = totalStudents;
        this.activeStudents = activeStudents;
        this.inactiveStudents = inactiveStudents;
        this.transferredStudents = transferredStudents;
        this.graduatedStudents = graduatedStudents;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public long getActiveStudents() {
        return activeStudents;
    }

    public long getInactiveStudents() {
        return inactiveStudents;
    }

    public long getTransferredStudents() {
        return transferredStudents;
    }

    public long getGraduatedStudents() {
        return graduatedStudents;
    }
}
