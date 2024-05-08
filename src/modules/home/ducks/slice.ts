import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface DrawState {
  value: number;
  templates: Templates[];
}

const initialState: DrawState = {
  value: 0,
  templates: []
}

export const templateSlice = createSlice({
  name: 'drawSlice',
  initialState,
  reducers: {
    setTemplates: (state, action: PayloadAction<Templates[]>) => {
      state.templates = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setTemplates } = templateSlice.actions

export default templateSlice.reducer