// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import DashboardLayout from '../../components/DashboardLayout';
// import { Alert } from '../../components/Feedback';
// import { ownerStops } from './OwnerDashboard';
// import { createHostel } from '../../api/hostels';
// import { apiErrorMessage } from '../../api/client';

// const AMENITY_OPTIONS = ['wifi', 'breakfast', 'parking', 'mountain_view', 'restaurant', 'heater', 'hot_water', 'laundry'];

// export default function CreateHostel() {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({
//     name: '',
//     property_type: 'hostel',
//     description: '',
//     address: '',
//     city: '',
//     state: '',
//     country: 'Pakistan',
//     latitude: '',
//     longitude: '',
//     total_rooms: '',
//     check_in_time: '14:00:00',
//     check_out_time: '12:00:00',
//     cancellation_policy: 'moderate',
//     min_stay_days: 1,
//   });
//   const [amenities, setAmenities] = useState([]);
//   const [photos, setPhotos] = useState([]);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const toggleAmenity = (a) =>
//     setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

//   const submit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([key, val]) => fd.append(key, val));
//       fd.append('amenities', JSON.stringify(amenities));
//       photos.forEach((p) => fd.append('photos', p));

//       const { data } = await createHostel(fd);
//       navigate(`/owner/hostels/${data.data.hostelId}/rooms`);
//     } catch (err) {
//       setError(apiErrorMessage(err, 'Could not create this listing.'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DashboardLayout stops={ownerStops} roleLabel="Owner">
//       <div className="dashboard-header">
//         <div>
//           <span className="eyebrow">New listing</span>
//           <h1 style={{ margin: 0 }}>Add a stay</h1>
//         </div>
//       </div>

//       <div className="card card-pad" style={{ maxWidth: 760 }}>
//         <Alert>{error}</Alert>
//         <form onSubmit={submit}>
//           <div className="form-grid">
//             <div className="field full">
//               <label>Property name</label>
//               <input name="name" required value={form.name} onChange={change} />
//             </div>
//             <div className="field">
//               <label>Property type</label>
//               <select name="property_type" value={form.property_type} onChange={change}>
//                 <option value="hostel">Hostel</option>
//                 <option value="guesthouse">Guesthouse</option>
//                 <option value="hotel">Hotel</option>
//                 <option value="homestay">Homestay</option>
//               </select>
//             </div>
//             <div className="field">
//               <label>Total rooms</label>
//               <input type="number" name="total_rooms" required min={1} value={form.total_rooms} onChange={change} />
//             </div>
//             <div className="field full">
//               <label>Description</label>
//               <textarea name="description" required value={form.description} onChange={change} />
//             </div>
//             <div className="field full">
//               <label>Address</label>
//               <input name="address" required value={form.address} onChange={change} />
//             </div>
//             <div className="field">
//               <label>City</label>
//               <input name="city" required value={form.city} onChange={change} placeholder="Hunza" />
//             </div>
//             <div className="field">
//               <label>State / region</label>
//               <input name="state" required value={form.state} onChange={change} placeholder="Gilgit-Baltistan" />
//             </div>
//             <div className="field">
//               <label>Country</label>
//               <input name="country" required value={form.country} onChange={change} />
//             </div>
//             <div className="field">
//               <label>Min stay (days)</label>
//               <input type="number" name="min_stay_days" min={1} value={form.min_stay_days} onChange={change} />
//             </div>
//             <div className="field">
//               <label>Latitude</label>
//               <input name="latitude" value={form.latitude} onChange={change} placeholder="36.3167" />
//             </div>
//             <div className="field">
//               <label>Longitude</label>
//               <input name="longitude" value={form.longitude} onChange={change} placeholder="74.6500" />
//             </div>
//             <div className="field">
//               <label>Check-in time</label>
//               <input type="time" name="check_in_time" value={form.check_in_time?.slice(0, 5)} onChange={(e) => setForm({ ...form, check_in_time: `${e.target.value}:00` })} />
//             </div>
//             <div className="field">
//               <label>Check-out time</label>
//               <input type="time" name="check_out_time" value={form.check_out_time?.slice(0, 5)} onChange={(e) => setForm({ ...form, check_out_time: `${e.target.value}:00` })} />
//             </div>
//             <div className="field full">
//               <label>Cancellation policy</label>
//               <select name="cancellation_policy" value={form.cancellation_policy} onChange={change}>
//                 <option value="flexible">Flexible</option>
//                 <option value="moderate">Moderate</option>
//                 <option value="strict">Strict</option>
//               </select>
//             </div>
//           </div>

//           <div className="field">
//             <label>Amenities</label>
//             <div className="chip-row">
//               {AMENITY_OPTIONS.map((a) => (
//                 <button
//                   type="button"
//                   key={a}
//                   className="chip"
//                   style={{
//                     cursor: 'pointer',
//                     background: amenities.includes(a) ? 'var(--moss)' : 'var(--paper-dim)',
//                     color: amenities.includes(a) ? 'var(--cream)' : 'var(--ink)',
//                     border: 'none',
//                   }}
//                   onClick={() => toggleAmenity(a)}
//                 >
//                   {a.replace('_', ' ')}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="field">
//             <label>Photos</label>
//             <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} />
//             <p className="field-hint">{photos.length} photo(s) selected</p>
//           </div>

//           <button className="btn btn-primary" disabled={loading} type="submit">
//             {loading ? 'Creating…' : 'Create listing'}
//           </button>
//         </form>
//       </div>
//     </DashboardLayout>
//   );
// }
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { Alert } from '../../components/Feedback';
import { ownerStops } from './OwnerDashboard';
import { createHostel } from '../../api/hostels';
import { apiErrorMessage } from '../../api/client';
import { RotateCcw, Image, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const AMENITY_OPTIONS = ['wifi', 'breakfast', 'parking', 'mountain_view', 'restaurant', 'heater', 'hot_water', 'laundry'];

export default function CreateHostel() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    property_type: 'hostel',
    description: '',
    address: '',
    city: '',
    state: '',
    country: 'Pakistan',
    latitude: '',
    longitude: '',
    total_rooms: '',
    check_in_time: '14:00:00',
    check_out_time: '12:00:00',
    cancellation_policy: 'moderate',
    min_stay_days: 1,
  });
  const [amenities, setAmenities] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [is360Mode, setIs360Mode] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleAmenity = (a) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validPhotos = files.filter(file => file.type.startsWith('image/'));
    
    if (validPhotos.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    // Check if trying to upload 360 photo
    if (is360Mode) {
      // For 360 photos, we need specific dimensions or metadata
      // For now, we'll just mark it as 360
      const markedPhotos = validPhotos.map(file => {
        // This is a marker - in production, you'd check EXIF data or dimensions
        const is360 = true;
        return { file, is360 };
      });
      setPhotos(prev => [...prev, ...markedPhotos]);
      toast.success(`${validPhotos.length} 360° photo(s) added`);
    } else {
      const markedPhotos = validPhotos.map(file => ({ file, is360: false }));
      setPhotos(prev => [...prev, ...markedPhotos]);
      toast.success(`${validPhotos.length} photo(s) added`);
    }
    
    setIs360Mode(false);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => fd.append(key, val));
      fd.append('amenities', JSON.stringify(amenities));
      photos.forEach(({ file, is360 }) => {
        fd.append('photos', file);
        // One is_360 flag per photo, in the same order, so the backend can
        // line each flag up with its file by index.
        fd.append('is_360', is360 ? '1' : '0');
      });

      const { data } = await createHostel(fd);
      toast.success('Hostel created successfully!');
      navigate(`/owner/hostels/${data.data.hostelId}/rooms`);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create this listing.'));
      toast.error('Failed to create hostel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout stops={ownerStops} roleLabel="Owner">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">New listing</span>
          <h1 style={{ margin: 0 }}>Add a stay</h1>
        </div>
      </div>

      <div className="card card-pad" style={{ maxWidth: 760 }}>
        <Alert>{error}</Alert>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field full">
              <label>Property name</label>
              <input name="name" required value={form.name} onChange={change} />
            </div>
            <div className="field">
              <label>Property type</label>
              <select name="property_type" value={form.property_type} onChange={change}>
                <option value="hostel">Hostel</option>
                <option value="guesthouse">Guesthouse</option>
                <option value="hotel">Hotel</option>
                <option value="homestay">Homestay</option>
              </select>
            </div>
            <div className="field">
              <label>Total rooms</label>
              <input type="number" name="total_rooms" required min={1} value={form.total_rooms} onChange={change} />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea name="description" required value={form.description} onChange={change} />
            </div>
            <div className="field full">
              <label>Address</label>
              <input name="address" required value={form.address} onChange={change} />
            </div>
            <div className="field">
              <label>City</label>
              <input name="city" required value={form.city} onChange={change} placeholder="Hunza" />
            </div>
            <div className="field">
              <label>State / region</label>
              <input name="state" required value={form.state} onChange={change} placeholder="Gilgit-Baltistan" />
            </div>
            <div className="field">
              <label>Country</label>
              <input name="country" required value={form.country} onChange={change} />
            </div>
            <div className="field">
              <label>Min stay (days)</label>
              <input type="number" name="min_stay_days" min={1} value={form.min_stay_days} onChange={change} />
            </div>
            <div className="field">
              <label>Latitude</label>
              <input name="latitude" value={form.latitude} onChange={change} placeholder="36.3167" />
            </div>
            <div className="field">
              <label>Longitude</label>
              <input name="longitude" value={form.longitude} onChange={change} placeholder="74.6500" />
            </div>
            <div className="field">
              <label>Check-in time</label>
              <input type="time" name="check_in_time" value={form.check_in_time?.slice(0, 5)} onChange={(e) => setForm({ ...form, check_in_time: `${e.target.value}:00` })} />
            </div>
            <div className="field">
              <label>Check-out time</label>
              <input type="time" name="check_out_time" value={form.check_out_time?.slice(0, 5)} onChange={(e) => setForm({ ...form, check_out_time: `${e.target.value}:00` })} />
            </div>
            <div className="field full">
              <label>Cancellation policy</label>
              <select name="cancellation_policy" value={form.cancellation_policy} onChange={change}>
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Amenities</label>
            <div className="chip-row">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  type="button"
                  key={a}
                  className="chip"
                  style={{
                    cursor: 'pointer',
                    background: amenities.includes(a) ? 'var(--moss)' : 'var(--paper-dim)',
                    color: amenities.includes(a) ? 'var(--cream)' : 'var(--ink)',
                    border: 'none',
                  }}
                  onClick={() => toggleAmenity(a)}
                >
                  {a.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Photos</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <button
                type="button"
                className={`btn btn-sm ${!is360Mode ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIs360Mode(false)}
              >
                <Image size={14} /> Regular Photos
              </button>
              <button
                type="button"
                className={`btn btn-sm ${is360Mode ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIs360Mode(true)}
              >
                <RotateCcw size={14} /> 360° Photos
              </button>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              style={{ display: 'block' }}
            />
            {is360Mode && (
              <p className="field-hint" style={{ color: 'var(--moss)' }}>
                For 360° photos, use equirectangular images (2:1 aspect ratio recommended)
              </p>
            )}
            <p className="field-hint">{photos.length} photo(s) selected</p>
            
            {/* Photo Preview */}
            {photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {photos.map(({ file, is360 }, index) => (
                  <div key={index} style={{ position: 'relative', width: 80, height: 80 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    {is360 && (
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'var(--moss)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '9px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}>
                        <RotateCcw size={10} /> 360
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        background: 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Creating…' : 'Create listing'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}