import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";

export function renderWithRouter(
  ui: ReactElement,
  { route = "/" }: { route?: string } = {},
) {
  window.history.pushState({}, "", route);
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
