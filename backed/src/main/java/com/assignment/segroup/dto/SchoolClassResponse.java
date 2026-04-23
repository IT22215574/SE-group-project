package com.assignment.segroup.dto;

import java.util.List;

public record SchoolClassResponse(
        Long id,
        String className,
        String grade,
        String academicYear,
        List<SubjectResponse> subjects
) {
}
