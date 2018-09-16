export interface KioskState {
  value: number;
  textState: TextState;
}

export interface TextState {
  text: string;
}

export const INITIAL_STATE: KioskState = {
  value: 0,
  textState: {
    text: 'foo',
  }
};
