/**
 * ログイン中ユーザー（モック）
 * 認証基盤は実装せず、ユーザーメニューから「ログインユーザー」を切り替えて権限の出し分けを確認できるようにする。
 */
export function useSession() {
  const db = useMockDb()
  const currentUserId = useState('session-user-id', () => 'U-0001')

  const currentUser = computed(() => db.value.users.find(u => u.id === currentUserId.value) ?? db.value.users[0]!)

  function switchUser(id: string) {
    currentUserId.value = id
  }

  return { currentUser, currentUserId: readonly(currentUserId), switchUser }
}
