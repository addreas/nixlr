import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.186.0/testing/asserts.ts";
import { shlexSplit } from "./shlex.ts";

Deno.test("should split an empty string into an empty array", () => {
  assertEquals(shlexSplit(""), []);
});

Deno.test("should split a simple string into individual words", () => {
  assertEquals(shlexSplit("foo bar baz"), ["foo", "bar", "baz"]);
});

Deno.test("should handle single quotes", () => {
  assertEquals(shlexSplit("foo 'bar baz'"), ["foo", "bar baz"]);
});

Deno.test("should handle double quotes", () => {
  assertEquals(shlexSplit('foo "bar baz"'), ["foo", "bar baz"]);
});

Deno.test("should handle escape characters", () => {
  assertEquals(shlexSplit('foo "bar\\"baz"'), ["foo", 'bar"baz']);
});

Deno.test("should handle leading and trailing whitespace", () => {
  assertEquals(shlexSplit("   foo   bar   "), ["foo", "bar"]);
});

Deno.test("should handle multiple types of quotes", () => {
  assertEquals(shlexSplit(`foo 'bar"baz' "qux'spam"`), [
    "foo",
    `bar"baz`,
    `qux'spam`,
  ]);
});

Deno.test("should handle newline characters", () => {
  assertEquals(shlexSplit(`foo\nbar\nbaz`), ["foo", "bar", "baz"]);
});

Deno.test("should throw an error on unmatched quotes", () => {
  assertThrows(() => shlexSplit(`foo 'bar "baz"`));
});
