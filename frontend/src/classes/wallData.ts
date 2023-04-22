export interface PostData {
  postContent: string,
  author: string,
  created: string,
  comments?: Comment[]
}

export interface Comment {
  content: string,
  author: string
}