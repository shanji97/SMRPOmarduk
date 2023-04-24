export interface PostData {
  id?: string,
  userId?: string,
  projectId?: string,
  title: string,
  postContent: string,
  author: string,
  created?: string,
  comments?: Comment[]
}

export interface Comment {
  id?: string,
  projectId?: string,
  notificationId?: string,
  content: string,
  author: string,
  userId: string,
  created?: string
}
