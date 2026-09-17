package com.spendwise.dashboard.controller;

import com.spendwise.dashboard.dto.CategoryBreakdownResponse;
import com.spendwise.dashboard.dto.DashboardSummaryResponse;
import com.spendwise.dashboard.dto.MonthlySummaryResponse;
import com.spendwise.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummaryResponse getSummary() {

        return dashboardService.getSummary();
    }

    @GetMapping("/category-breakdown")
    public List<CategoryBreakdownResponse> getCategoryBreakdown() {

        return dashboardService.getCategoryBreakdown();
    }

    @GetMapping("/monthly-summary")
    public List<MonthlySummaryResponse> getMonthlySummary() {

        return dashboardService.getMonthlySummary();
    }
}