import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect } from "vitest";
import Header from "../Header";

afterEach(cleanup);

describe("Header", () => {
  it("renders the app name", () => {
    render(<Header />);
    expect(screen.getByText("TestApp")).toBeDefined();
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Home")).toBeDefined();
    expect(screen.getByText("About")).toBeDefined();
  });
});
