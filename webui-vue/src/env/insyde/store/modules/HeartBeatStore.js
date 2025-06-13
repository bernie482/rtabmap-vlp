const HeartBeatStore = {
  namespaced: true,
  state: {
    ignoreLogout: false,
  },
  getters: {
    isIgnoreLogout: (state) => state.ignoreLogout,
  },
  mutations: {
    setIgnoreLogout: (state, ignoreLogout) => {
      state.ignoreLogout = ignoreLogout;
    },
  },
  actions: {
    ignoreLogout: ({ commit }, ignore) => {
      commit('setIgnoreLogout', ignore);
    },
  },
};

export default HeartBeatStore;
