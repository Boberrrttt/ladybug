import type { Photo } from "@/shared/types";
import { deletePhotoAction } from "../services/photos.actions";

export function PhotoGrid({ photos, canDelete = false }: { photos: Photo[]; canDelete?: boolean }) {
  if (photos.length === 0) {
    return (
      <div>
        <p className="mb-4 text-base text-mute">Add the first photo.</p>
        <div className="pin-grid">
          <div className="pin h-48 bg-card" />
          <div className="pin h-64 bg-card" />
          <div className="pin h-40 bg-card" />
        </div>
      </div>
    );
  }

  return (
    <ul className="pin-grid">
      {photos.map((photo) => (
        <li key={photo.id} className="pin relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="Event photo" />
          {canDelete ? (
            <form action={deletePhotoAction} className="absolute bottom-2 right-2">
              <input type="hidden" name="photoId" value={photo.id} />
              <button type="submit" className="btn-pill">
                Delete
              </button>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
