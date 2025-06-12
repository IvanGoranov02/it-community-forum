"use client";
import { Component, ReactNode } from "react";

export class NoStrictMode extends Component<{ children: ReactNode }> {
  render() {
    return <div suppressHydrationWarning={true}>{this.props.children}</div>;
  }
} 