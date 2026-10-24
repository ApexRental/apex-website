/**
 * Which month a date picker should display. A selected date always wins;
 * otherwise jump forward to the earliest allowed date's month when the
 * current view is before it (e.g. a return-date picker whose minimum moved to
 * next month), and leave the view alone in every other case.
 */
export function monthToShow(view: Date, selected: Date | null, min: Date | null): Date {
  if (selected) return selected;
  if (!min) return view;
  const viewIndex = view.getFullYear() * 12 + view.getMonth();
  const minIndex = min.getFullYear() * 12 + min.getMonth();
  return minIndex > viewIndex ? min : view;
}
