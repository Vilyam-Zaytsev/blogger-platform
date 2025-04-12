import {LikeStatus} from "../../07-likes/like-entity";

type ReactionsHolder = {
    reactions: {
        likeCount: number;
        dislikeCount: number;
        [key: string]: number;
    };
};

function updateReactionsCount(this: ReactionsHolder, newReaction: LikeStatus, currentReaction: LikeStatus | null) {

    if (currentReaction) {

        const currentReactionKey: string = `${currentReaction.toLowerCase()}Count`;

        this.reactions[currentReactionKey] -= 1;

    }

    switch (newReaction) {

        case LikeStatus.None:

            return;
        case LikeStatus.Dislike:

            this.reactions.dislikeCount += 1;

            return;
        case LikeStatus.Like:
            this.reactions.likeCount += 1;

            return;
    }
}


export {
    updateReactionsCount
};