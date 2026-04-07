export type CreateHandleChangeArgsWithDescriptions<T> =
  | [field: Exclude<keyof T, "descriptions" | "visible">, value: string]
  | [field: "descriptions", value: string[]];
