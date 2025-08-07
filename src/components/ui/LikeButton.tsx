import { useState, useEffect } from "react";
import { Button } from "./button";
import { useToast } from "./use-toast";
import { Heart } from "lucide-react";
import {
  likePost,
  unlikePost,
  getLikesCount,
  hasLiked,
} from "@/integrations/supabase/likes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface LikeButtonProps {
  postId: string;
  userId: string;
}

export function LikeButton({ postId, userId }: LikeButtonProps) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likers, setLikers] = useState<
    Array<{ user_id: string; profiles: { full_name: string } }>
  >([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch initial like state
  useEffect(() => {
    let mounted = true;
    const fetchInitialState = async () => {
      try {
        const [count, liked] = await Promise.all([
          getLikesCount(postId),
          hasLiked(postId, userId),
        ]);
        if (mounted) {
          setLikeCount(count);
          setIsLiked(liked);
        }
      } catch (error) {
        console.error("Error fetching like state:", error);
        if (mounted) {
          setIsLiked(false);
          setLikeCount(0);
        }
      }
    };
    fetchInitialState();

    return () => {
      mounted = false;
    };
  }, [postId, userId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isLiked) {
        await unlikePost(postId, userId);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(postId, userId);
        setLikeCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showLikers = async () => {
    if (likeCount === 0) return;
    setDialogOpen(true);
    const { data } = await getLikers(postId);
    if (data) setLikers(data);
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={loading}
      >
        <Heart
          className="h-4 w-4"
          fill={isLiked ? "currentColor" : "none"}
        />
      </Button>

      {likeCount > 0 && (
        <div className="text-sm">
          <button
            onClick={showLikers}
            className="text-primary hover:underline"
          >
            {isLiked ? `You and ${likeCount - 1} others` : `${likeCount} likes`}
          </button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>People who liked this post</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {likers.map((liker) => (
              <div key={liker.user_id} className="flex items-center gap-2">
                <span className="font-medium">{liker.profiles.full_name}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}