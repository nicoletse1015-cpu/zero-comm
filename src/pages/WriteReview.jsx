import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Star, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function WriteReview() {
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('propertyId');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: property } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      const results = await base44.entities.Property.filter({ id: propertyId });
      return results[0];
    },
    enabled: !!propertyId
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Review.create({
        property_id: propertyId,
        reviewer_id: String(user.id),
        reviewer_name: user.full_name || user.email,
        rating,
        comment,
        review_type: 'transaction'
      });
    },
    onSuccess: () => {
      toast.success('評價已提交');
      window.location.href = createPageUrl('TransactionHistory');
    },
    onError: () => {
      toast.error('提交失敗，請稍後再試');
    }
  });

  if (!user || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF385C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('TransactionHistory')} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">撰寫評價</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Property Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={property.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{property.district}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium mb-4">你的整體評分</h3>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star 
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hoverRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {rating === 0 && '點擊星星評分'}
              {rating === 1 && '非常差'}
              {rating === 2 && '差'}
              {rating === 3 && '一般'}
              {rating === 4 && '好'}
              {rating === 5 && '非常好'}
            </p>
          </CardContent>
        </Card>

        {/* Comment */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">分享你的體驗</h3>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="你可以分享交易過程、業主/租客的溝通、物業狀況等..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-400 mt-2">
              你的評價將幫助其他用戶做出更好的決定
            </p>
          </CardContent>
        </Card>

        <Button 
          onClick={() => submitReviewMutation.mutate()}
          disabled={rating === 0 || submitReviewMutation.isPending}
          className="w-full bg-[#FF385C] hover:bg-[#E31C5F]"
        >
          {submitReviewMutation.isPending ? '提交中...' : '提交評價'}
        </Button>
      </main>
    </div>
  );
}