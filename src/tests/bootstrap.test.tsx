import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { App } from "../app/App";
import { resetDatabase } from "../lib/storage/db";
import { useFocusStore } from "../features/focus/focusStore";
import { useProjectStore } from "../features/projects/projectStore";
import { useReportStore } from "../features/reports/reportStore";
import { useTaskStore } from "../features/tasks/taskStore";
import { renderWithRouter } from "./test-utils";

describe("App shell", () => {
  beforeEach(async () => {
    await resetDatabase();
    useProjectStore.setState({ isLoaded: false, projects: [] });
    useTaskStore.setState({ isLoaded: false, tasks: [] });
    useFocusStore.setState({ focusRefs: [], isLoaded: false });
    useReportStore.setState({ isLoaded: false, reports: [] });
  });

  test("renders primary navigation for Home and Report Center", async () => {
    renderWithRouter(<App />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Personal To-do" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Report Center" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { level: 2, name: "今日焦点" }),
    ).toBeInTheDocument();
  });
});
