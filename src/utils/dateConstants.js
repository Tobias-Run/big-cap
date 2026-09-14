/**
 * Single source of truth for "today" as far as age math goes.
 * Previously the year 2024 was hardcoded in ~10 places (App.jsx, ControlsBar,
 * CompanyDetailModal, RegionalKPICards, SearchableDataTable, BubbleClusterView,
 * TimelineView). Every place that computes a company's age or an age-based
 * cutoff should import CURRENT_YEAR from here instead of hardcoding a year,
 * so the 50-year filter (and everything derived from it) keeps tracking
 * reality instead of freezing at the year the data was curated.
 */
export const CURRENT_YEAR = new Date().getFullYear();
