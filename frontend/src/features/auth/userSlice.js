import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  role: localStorage.getItem("role") || null,
  email: localStorage.getItem("email") || null,
  username: localStorage.getItem("username") || null,
  token: localStorage.getItem("token") || null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      const { role, email, username, token } = action.payload;
      state.role = role;
      state.email = email;
      state.username = username;
      state.token = token;
      state.loading = false;

      localStorage.setItem("role", role);
      localStorage.setItem("email", email);
      localStorage.setItem("username", username);
      localStorage.setItem("token", token);
    },
    clearUser: (state) => {
      state.role = null;
      state.email = null;
      state.username = null;
      state.token = null;
      state.loading = false;
      
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("username");
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;