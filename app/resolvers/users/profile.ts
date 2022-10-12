import { useRoute } from "../../utils/pogo-resolver/mod.ts";


export const profile = useRoute({
  resolve: ({ req: { user }, res }) => {
    if (!user) return res.error('Something happened on server.');
  
    return res.success({
      id: user.id,
      email: user.email,
      content: user.content,
      nickname: user.nickname,
      role: user.role,
      registered: user.registered,
    });
  },
});
