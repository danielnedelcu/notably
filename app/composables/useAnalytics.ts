export const useAnalytics = () => {
  const { gtag } = useGtag();

  const trackPostLiked = (postId: string, postTitle: string) => {
    gtag("event", "post_liked", {
      post_id: postId,
      post_title: postTitle,
    });
  };

  const trackPostShared = (
    postId: string,
    postTitle: string,
    method: string,
  ) => {
    gtag("event", "post_shared", {
      post_id: postId,
      post_title: postTitle,
      method,
    });
  };

  const trackPostReadComplete = (postId: string, postTitle: string) => {
    gtag("event", "post_read_complete", {
      post_id: postId,
      post_title: postTitle,
    });
  };

  return {
    trackPostLiked,
    trackPostShared,
    trackPostReadComplete,
  };
};
