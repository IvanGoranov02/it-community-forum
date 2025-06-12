"use client";
import { Component, ReactNode } from "react";

export class NoStrictMode extends Component<{ children: ReactNode }> {
  render() {
    return this.props.children;
  }
} 