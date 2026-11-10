import { useState } from 'react';
import type { ChangeEvent, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCurrentUser } from '../blog/AuthContext';
import { MAX_BIO_LENGTH, MAX_LOCATION_LENGTH, MAX_NAME_LENGTH, MAX_WEBSITE_LENGTH } from '../blog/dataStore';
import { resizeImage } from '../blog/images';
import Avatar from '../ui/components/Avatar';
import Notice from '../ui/components/Notice';
import type { NoticeState } from '../ui/components/Notice';

// Maximum length of the photos as data URLs. firestore.rules uses the same limits.
const AVATAR_MAX_LENGTH = 150_000;
const BANNER_MAX_LENGTH = 300_000;

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l1.5-2h5L15 8h1M4 8v10h14v-4" />
      <circle cx="11" cy="13" r="3" />
      <path d="M19 3v5M16.5 5.5h5" />
    </svg>
  );
}

// "Edit profile" screen, like X: photos, name, bio, location, website and birth date.
export default function EditProfile() {
  const currentUser = useCurrentUser();
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const initial = {
    fullName: currentUser.fullName,
    bio: currentUser.bio ?? '',
    location: currentUser.location ?? '',
    website: currentUser.website ?? '',
    birthDate: currentUser.birthDate ?? '',
    avatarUrl: currentUser.avatarUrl ?? '',
    bannerUrl: currentUser.bannerUrl ?? '',
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const profilePath = `/users/${currentUser.username}`;
  const changed = (Object.keys(initial) as Array<keyof typeof initial>).some((key) => form[key] !== initial[key]);
  const canSave = changed && form.fullName.trim().length > 0 && !saving;

  const setField = (field: keyof typeof initial, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setNotice(null);
  };

  const pickPhoto = (field: 'avatarUrl' | 'bannerUrl') => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const photo = field === 'avatarUrl'
        ? await resizeImage(file, 256, 256, AVATAR_MAX_LENGTH)
        : await resizeImage(file, 900, 300, BANNER_MAX_LENGTH);
      setField(field, photo);
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not use the image' });
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;
    setSaving(true);
    try {
      await updateProfile({ ...form, fullName: form.fullName.trim(), website: form.website.trim(), location: form.location.trim() });
      navigate(profilePath);
    } catch (err) {
      setNotice({ type: 'error', message: err instanceof Error ? err.message : 'Could not save the profile' });
      setSaving(false);
    }
  };

  return (
    <section>
      <form className="edit-profile" onSubmit={handleSubmit}>
        <div className="edit-topbar">
          <button type="button" className="edit-cancel" onClick={() => navigate(profilePath)}>Cancel</button>
          <strong>Edit profile</strong>
          <button type="submit" className="edit-save" disabled={!canSave}>{saving ? 'Saving...' : 'Save'}</button>
        </div>

        <div className="edit-banner" style={form.bannerUrl ? { backgroundImage: `url(${form.bannerUrl})` } : undefined}>
          <label className="photo-picker" title="Add banner photo">
            <CameraIcon />
            <input type="file" accept="image/*" onChange={pickPhoto('bannerUrl')} aria-label="Add banner photo" />
          </label>
        </div>
        <div className="edit-avatar">
          <Avatar name={form.fullName || currentUser.fullName} src={form.avatarUrl || undefined} />
          <label className="photo-picker" title="Add profile photo">
            <CameraIcon />
            <input type="file" accept="image/*" onChange={pickPhoto('avatarUrl')} aria-label="Add profile photo" />
          </label>
        </div>

        <div className="edit-row">
          <label className="edit-label" htmlFor="edit-name">Name</label>
          <input id="edit-name" value={form.fullName} maxLength={MAX_NAME_LENGTH} onChange={(e) => setField('fullName', e.target.value)} />
        </div>
        <div className="edit-row">
          <label className="edit-label" htmlFor="edit-bio">Bio</label>
          <textarea id="edit-bio" rows={3} value={form.bio} maxLength={MAX_BIO_LENGTH} placeholder="Add a bio to your profile" onChange={(e) => setField('bio', e.target.value)} />
        </div>
        <div className="edit-row">
          <label className="edit-label" htmlFor="edit-location">Location</label>
          <input id="edit-location" value={form.location} maxLength={MAX_LOCATION_LENGTH} placeholder="Add your location" onChange={(e) => setField('location', e.target.value)} />
        </div>
        <div className="edit-row">
          <label className="edit-label" htmlFor="edit-website">Website</label>
          <input id="edit-website" value={form.website} maxLength={MAX_WEBSITE_LENGTH} placeholder="Add your website" onChange={(e) => setField('website', e.target.value)} />
        </div>
        <div className="edit-row">
          <label className="edit-label" htmlFor="edit-birth">Birth date</label>
          <input id="edit-birth" type="date" value={form.birthDate} max={today} onChange={(e) => setField('birthDate', e.target.value)} />
        </div>

        {notice && <Notice type={notice.type} message={notice.message} />}
      </form>
    </section>
  );
}
