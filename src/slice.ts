import useThunkReducer from "react-hook-thunk-reducer";

type SliceCaseReducers<State> = Record<
  string,
  (state: State, action: { payload: any }) => void
>;

type ActionsFromCaseReducers<
  State,
  CaseReducers extends SliceCaseReducers<State>
> = {
  [Type in keyof CaseReducers]: Parameters<
    CaseReducers[Type]
  >[1] extends undefined
    ? { type: Type }
    : {
        type: Type;
        payload: Parameters<CaseReducers[Type]>[1]["payload"];
      };
};

type CaseReducerActions<
  State,
  CaseReducers extends SliceCaseReducers<State>
> = {
  [Type in keyof CaseReducers]: Parameters<
    CaseReducers[Type]
  >[1] extends undefined
    ? () => ActionsFromCaseReducers<State, CaseReducers>[Type]
    : (
        payload: Parameters<CaseReducers[Type]>[1]["payload"]
      ) => ActionsFromCaseReducers<State, CaseReducers>[Type];
};

interface Slice<State, CaseReducers extends SliceCaseReducers<State>> {
  initialState: State;
  reducer: (
    state: State,
    action: ActionsFromCaseReducers<State, CaseReducers>[keyof CaseReducers]
  ) => State;
  actions: CaseReducerActions<State, CaseReducers>;
}

export function createSlice<
  State,
  CaseReducers extends SliceCaseReducers<State>
>({
  initialState,
  reducers,
}: {
  initialState: State;
  reducers: CaseReducers;
}): Slice<State, CaseReducers> {
  const reducer = (
    state: State,
    action: ActionsFromCaseReducers<State, CaseReducers>[keyof CaseReducers]
  ) => {
    reducers[action.type](state, action as any);
    return { ...state };
  };

  const actions = Object.fromEntries(
    Object.keys(reducers).map(
      (type) => [type, (payload: any) => ({ type, payload })] as const
    )
  ) as CaseReducerActions<State, CaseReducers>;

  return { initialState, reducer, actions };
}

export function useSlice<State, CaseReducers extends SliceCaseReducers<State>>(
  slice: Slice<State, CaseReducers>
) {
  return useThunkReducer<
    State,
    ActionsFromCaseReducers<State, CaseReducers>[keyof CaseReducers]
  >(slice.reducer, slice.initialState);
}
