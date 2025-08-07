import { useState, useEffect } from "react";
import { Button } from "./button";
import { useToast } from "./use-toast";
import { Heart } from "lucide-react";
import {
  likePost,
  unlikePost,
  getLikesCount,
  hasLiked,
  getLikers,
} from "@/integrations/supabase/likes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

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
        const [count, liked, likers] = await Promise.all([
          getLikesCount(postId),
          hasLiked(postId, userId),
          getLikers(postId),
        ]);
        if (mounted) {
          setLikeCount(count);
          setIsLiked(liked);
          setLikers(likers);
        }
      } catch (error) {
        console.error("Error fetching like state:", error);
        if (mounted) {
          setIsLiked(false);
          setLikeCount(0);
          setLikers([]);
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
            {likers.length > 0 ? (
              <ul>
                {likers.map((liker) => (
                  <li key={liker.user_id}>
                    <Link
                      to={`/profile/${liker.user_id}`}
                      className="flex items-center gap-2 hover:bg-accent px-2 py-1 rounded transition"
                      onClick={() => setDialogOpen(false)}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage
                          src={liker.profiles?.avatar_url || ""}
                          alt={liker.profiles?.full_name || "User"}
                        />
                        <AvatarFallback>
                          {liker.profiles?.full_name
                            ? liker.profiles.full_name[0]
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {liker.profiles?.full_name || "Unknown"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No likes yet.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}