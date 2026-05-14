package com.assignment.segroup.dto;

import java.util.List;

public record SchoolClassResponse(
        String id,
        String className,
        String grade,
        String academicYear,
        String notes,
        List<SubjectResponse> subjects
) {
}
