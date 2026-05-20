import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'BOOTSTRAP_DONE':
      return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGIN':
      return { ...state, user: action.user, token: action.token, loading: false };
    case 'LOGOUT':
      return { user: null, token: null, loading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      dispatch({ type: 'BOOTSTRAP_DONE', user: null, token: null });
      return;
    }
    api
      .get('/auth/me')
      .then((res) => {
        const user = res.data.data.user;
        dispatch({ type: 'BOOTSTRAP_DONE', user, token });
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'BOOTSTRAP_DONE', user: null, token: null });
      });
  }, []);

  const login = useCallback(async (path, body) => {
    const res = await api.post(path, body);
    const { token, user } = res.data.data;
    localStorage.setItem('token', token);
    localStorage.removeItem('user');
    dispatch({ type: 'LOGIN', user, token });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo(
    () => ({
      user: state.user,
      token: state.token,
      loading: state.loading,
      isAuthenticated: Boolean(state.token && state.user),
      login,
      logout,
    }),
    [state.user, state.token, state.loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
