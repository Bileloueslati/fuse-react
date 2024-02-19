"use client";

import {
  Box,
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  type TypographyProps,
} from "@mui/material";
import { type ChangeEvent, useEffect, useMemo, startTransition } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Fuse, { type FuseResult } from "fuse.js";
import list from "./data";
import highlight from "react-string-replace";
import { useSetState } from "react-use";
import { removeStopwords, eng } from "stopword";

type State<R extends unknown[]> = {
  query: string;
  pattern: string;
  result: FuseResult<R[number]>[] | null;
};

const Search = () => {
  const fuse = useMemo(
    () =>
      new Fuse(list, {
        includeScore: true,
        includeMatches: true,
        ignoreLocation: true,
        threshold: 0.2,
        keys: ["title", "description"],
        minMatchCharLength: 3,
      }),
    []
  );

  const [{ query, pattern, result }, set] = useSetState<State<typeof list>>({
    query: "",
    pattern: "",
    result: null,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    set({ query: e.target.value });

  const reset = () => set({ query: "" });

  useEffect(() => {
    const pattern = removeStopwords(query.split(" "), eng).join(" ");

    const result = fuse.search(pattern, { limit: 10 });
    startTransition(() => {
      set({ result, pattern });
    });
  }, [query, fuse, set]);

  return (
    <Container sx={{ my: 3 }}>
      <TextField
        autoComplete="off"
        onChange={handleChange}
        placeholder="Search"
        value={query}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Reset search result"
                onClick={reset}
                edge="end"
              />
              <CloseIcon
                sx={{
                  opacity: Number(query.length >= 3),
                }}
              />
            </InputAdornment>
          ),
        }}
      />

      <Stack component="ul">
        {result &&
          result.map(({ item: { id, title, description } }) => (
            <Box component="li" key={id}>
              <Highlighter value={title} query={pattern} />
              <Highlighter value={description} query={pattern} />
            </Box>
          ))}
      </Stack>
    </Container>
  );
};

const Highlighter = ({
  value,
  query,
  ...props
}: TypographyProps & { value: string; query: string }) => (
  <Typography {...props}>
    {highlight(value, query, (match) => (
      <Typography component="span" color="red" key={Math.random()}>
        {match}
      </Typography>
    ))}
  </Typography>
);

export default Search;
