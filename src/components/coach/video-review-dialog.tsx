"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Play, Pause } from "lucide-react";
import { useState } from "react";

type VideoReview = {
  id: string;
  playerName: string;
  title: string;
  uploadDate: string;
  videoUrl?: string;
};

export default function VideoReviewDialog({ video }: { video: VideoReview }) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<
    Array<{ time: number; text: string; author: string }>
  >([
    {
      time: 15,
      text: "Your backhand technique needs more follow-through",
      author: "Coach",
    },
    { time: 32, text: "Great footwork here!", author: "Coach" },
  ]);
  const [newComment, setNewComment] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        { time: currentTime, text: newComment, author: "Coach" },
      ]);
      setNewComment("");
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <Button
        className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        onClick={() => setOpen(true)}
      >
        Review Video
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Video Review: {video.title}</DialogTitle>
            <DialogDescription>
              Player: {video.playerName} | Uploaded: {video.uploadDate}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {/* Video Player */}
            <div className="md:col-span-2">
              <div className="bg-black rounded-lg aspect-video relative overflow-hidden">
                {/* Placeholder for actual video */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="mb-4 text-gray-400">Video Player</div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full bg-white/10 hover:bg-white/20"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Video controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <div className="text-white text-xs">
                      {formatTime(currentTime)}
                    </div>
                    <div className="flex-1 h-1 bg-gray-700 rounded-full">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${(currentTime / 120) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-white text-xs">2:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex flex-col h-[400px] border rounded-lg">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Comments
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">
                        {comment.author}
                      </span>
                      <button
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded hover:bg-blue-200"
                        onClick={() => setCurrentTime(comment.time)}
                      >
                        {formatTime(comment.time)}
                      </button>
                    </div>
                    <p className="text-sm mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment at current time..."
                    className="min-h-[80px] text-sm"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Adding comment at {formatTime(currentTime)}
                  </span>
                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleAddComment}
                  >
                    <Send className="h-3 w-3" /> Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                alert("Review saved successfully!");
                setOpen(false);
              }}
            >
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
