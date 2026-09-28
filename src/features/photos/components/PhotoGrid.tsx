import { Trash } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import type { Photo } from "@/shared/types";
import { deletePhotoAction } from "../services/photos.actions";

export function PhotoGrid({ photos, canDelete = false }: { photos: Photo[]; canDelete?: boolean }) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col gap-5 rounded-md bg-card p-6 sm:flex-row sm:items-center">
        <div className="pin relative aspect-[4/3] w-full shrink-0 sm:w-56">
          <Image
            src="/pins/pin-table.png"
            alt="Dinner table at an evening event"
            fill
            className="object-cover"
            sizes="224px"
          />
        </div>
        <p className="max-w-[65ch] text-base text-mute">Add the first photo.</p>
      </div>
    );
  }

  const gridClass = photos.length === 1 ? "max-w-xl" : photos.length < 4 ? "pin-grid pin-grid-2" : "pin-grid";

  return (
    <ul className={gridClass}>
      {photos.map((photo) => (
        <li key={photo.id} className="pin relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="Event photo" />
          {canDelete ? (
            <form action={deletePhotoAction} className="absolute bottom-2 right-2">
              <input type="hidden" name="photoId" value={photo.id} />
              <button type="submit" className="btn-pill gap-1" aria-label="Delete photo">
                <Trash size={16} weight="bold" aria-hidden="true" />
              </button>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
