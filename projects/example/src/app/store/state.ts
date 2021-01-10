export interface KioskState {
  value: number;
  textState: TextState;
}

export interface TextState {
  text: string;
  text2State: Text2State;
}

export interface Text2State {
  text2: string;
}

export const INITIAL_STATE: KioskState = {
  value: 0,
  textState: {
    text: 'foo',
    text2State: {
      text2: 'bar',
    }
  }
};
