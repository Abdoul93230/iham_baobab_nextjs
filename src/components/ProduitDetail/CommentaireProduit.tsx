"use client";

import React, { useState } from "react";
import { Star, X, ThumbsUp, User } from "lucide-react";

interface Comment {
  _id: string;
  userName?: string;
  etoil: number;
  description?: string;
  review: string;
  date: string;
}

interface CommentaireProduitProps {
  name: string;
  img?: string[];
  coments: Comment[];
  categorie?: { name: string };
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });

const StarRow = ({ count, size = 14 }: { count: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= count ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
      />
    ))}
  </div>
);

const CommentCard = ({ comment }: { comment: Comment }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3 mb-2">
      <div className="w-9 h-9 bg-gradient-to-br from-[#30A08B] to-[#1d7a6a] rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
        {comment.userName
          ? comment.userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
          : <User size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">
          {comment.userName || "Anonyme"}
        </p>
        <StarRow count={comment.etoil} />
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(comment.date)}</span>
    </div>
    {comment.description && (
      <p className="text-sm text-gray-700 leading-relaxed mb-1">{comment.description}</p>
    )}
    {comment.review && comment.review !== comment.description && (
      <p className="text-sm text-gray-600">{comment.review}</p>
    )}
    <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 cursor-pointer hover:text-[#30A08B] transition-colors w-fit">
      <ThumbsUp size={12} />
      <span>Utile</span>
    </div>
  </div>
);

const CommentaireProduit: React.FC<CommentaireProduitProps> = ({ coments }) => {
  const [showModal, setShowModal] = useState(false);

  if (coments.length === 0) return null;

  const avgRating =
    coments.reduce((s, c) => s + (c.etoil || 0), 0) / coments.length;

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: coments.filter((c) => Math.round(c.etoil) === star).length,
  }));

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-gray-900">
          Avis des acheteurs
          <span className="ml-2 text-sm font-normal text-gray-400">({coments.length})</span>
        </h2>
      </div>

      {/* Rating summary */}
      <div className="flex gap-6 mb-5 p-4 bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center justify-center min-w-[72px]">
          <span className="text-4xl font-black text-gray-900">{avgRating.toFixed(1)}</span>
          <StarRow count={Math.round(avgRating)} size={16} />
          <span className="text-xs text-gray-400 mt-1">{coments.length} avis</span>
        </div>
        <div className="flex-1 space-y-1.5">
          {ratingDist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-gray-500 text-right">{star}</span>
              <Star size={11} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: coments.length > 0 ? `${(count / coments.length) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-5 text-gray-400 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Comments grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {coments.slice(0, 4).map((c) => (
          <CommentCard key={c._id} comment={c} />
        ))}
      </div>

      {coments.length > 4 && (
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 w-full py-2.5 rounded-xl border border-[#30A08B] text-[#30A08B] text-sm font-semibold hover:bg-[#f0faf7] transition-colors"
        >
          Voir tous les {coments.length} avis
        </button>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Tous les avis ({coments.length})</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coments.map((c) => (
                  <CommentCard key={c._id} comment={c} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentaireProduit;
