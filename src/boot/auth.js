import { boot } from 'quasar/wrappers'
import { useAuthStore } from 'src/stores/auth'

export default boot(({ app, store }) => {
  // const authStore = useAuthStore(store)
  // authStore.initialize() // exemple : synchronise session, tokens, etc.
})
