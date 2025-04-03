enum LikeStatus {
    None = 'None',
    Like = 'Like',
    Dislike = 'Dislike'
}

type Like = {
    status: LikeStatus,
    userId: string,
    parentId: string
};

// type