# Tối ưu hoá API Calls với TanStack React Query

## Vấn đề trước khi tối ưu

- API `get_info` được gọi nhiều lần khi reload trang
- Mỗi component sử dụng `useAuth()` có thể trigger duplicate API calls
- Không có caching, leading to unnecessary network requests
- Manual state management dẫn đến complexity

## Giải pháp

### 1. Cài đặt TanStack React Query

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### 2. Setup QueryProvider

- Tạo `QueryProvider` component với cấu hình tối ưu:
  - `staleTime`: 5 phút cho auth, 3-5 phút cho các data khác
  - `gcTime`: 10-15 phút
  - `retry`: 1-2 lần
  - Không refetch khi window focus hoặc reconnect

### 3. Tạo Query Hooks

#### Authentication (`use-query-auth.tsx`)

- `useUserInfo()`: Cache user info với automatic token validation
- `useInvalidateAuth()`: Helper functions để invalidate/remove auth cache

#### Chatbots (`use-query-chatbots.tsx`)

- `useChatbots()`: Cache danh sách chatbots của user
- `usePublicChatbots()`: Cache danh sách chatbots public
- `useChatbotDetail()`: Cache chi tiết chatbot
- `useInvalidateChatbots()`: Helper functions để invalidate cache

#### Documents (`use-query-documents.tsx`)

- `useDocuments()`: Cache documents theo botId
- `useInvalidateDocuments()`: Helper functions để invalidate cache

### 4. Refactor useAuth Hook

- Thay thế manual state management bằng React Query
- Sync với Zustand state cho backward compatibility
- Automatic error handling và loading states

### 5. Update Components

- `chatbot-list-client.tsx`: Sử dụng query hooks thay vì manual API calls
- `editor-chatbot-client.tsx`: Sử dụng `useChatbotDetail` hook
- `rag-agent-client.tsx`: Sử dụng `useChatbotDetail` hook

## Lợi ích sau tối ưu

### 🚀 Performance Improvements

- **Giảm số lượng API calls**: Cache tự động prevent duplicate requests
- **Faster loading**: Data được cache và reuse across components
- **Background refetching**: Data luôn fresh mà không block UI

### 🧹 Code Quality

- **Cleaner code**: Loại bỏ manual loading states và error handling
- **Better error handling**: Centralized error handling với automatic retry
- **Type safety**: Full TypeScript support với proper typing

### 🔧 Developer Experience

- **React Query Devtools**: Debug queries easily trong development
- **Automatic invalidation**: Cache tự động invalidate khi cần
- **Optimistic updates**: Smooth user experience

## Cấu hình Query Keys

```typescript
export const QUERY_KEYS = {
  AUTH: {
    USER_INFO: ["auth", "userInfo"] as const,
  },
  CHATBOTS: {
    LIST: ["chatbots", "list"] as const,
    PUBLIC: ["chatbots", "public"] as const,
    DETAIL: (id: string) => ["chatbots", "detail", id] as const,
  },
  DOCUMENTS: {
    BY_BOT: (botId: string) => ["documents", "bot", botId] as const,
  },
} as const;
```

## Cache Strategy

### User Authentication

- **Stale Time**: 5 phút
- **GC Time**: 10 phút
- **Auto refetch**: Khi token change

### Chatbots

- **Stale Time**: 3-5 phút
- **GC Time**: 10-15 phút
- **Invalidation**: Sau create/update/delete operations

### Documents

- **Stale Time**: 3 phút
- **GC Time**: 10 phút
- **Invalidation**: Sau upload/delete operations

## Monitoring

- Sử dụng React Query Devtools để monitor:
  - Query status và cache
  - Network requests
  - Error states
  - Cache invalidation events

## Migration Guide

1. ✅ Install packages
2. ✅ Setup QueryProvider in layout
3. ✅ Create query hooks for each service
4. ✅ Update useAuth to use React Query
5. ✅ Refactor components to use query hooks
6. ✅ Test and verify performance improvements

## Best Practices

- Sử dụng `enabled` option để control khi nào query chạy
- Proper error handling với user-friendly messages
- Invalidate cache sau mutations (create/update/delete)
- Use optimistic updates cho better UX khi có thể
