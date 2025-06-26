import { MedicalCenter, UserLocation } from '../types';

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findNearestCenter = (
  userLocation: UserLocation,
  centers: MedicalCenter[]
): MedicalCenter | null => {
  if (!userLocation || centers.length === 0) return null;

  let nearest = centers[0];
  let minDistance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    nearest.lat,
    nearest.lng
  );

  for (const center of centers) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      center.lat,
      center.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = center;
    }
  }

  return nearest;
};

export const getCenterIcon = (type: MedicalCenter['type']) => {
  switch (type) {
    case 'hospital':
      return '🏨'; // Hotel emoji, often used for hospitals
    case 'clinic':
      return '💉'; // Syringe emoji for clinics
    case 'health_center':
      return '🩺'; // Stethoscope emoji for health centers
    default:
      return '🏥'; // Default hospital emoji
  }
};

export const getCenterColor = (type: MedicalCenter['type']) => {
  switch (type) {
    case 'hospital':
      return '#EF4444'; // Rojo
    case 'clinic':
      return '#3B82F6'; // Azul
    case 'health_center':
      return '#10B981'; // Verde
    default:
      return '#6B7280';
  }
};

export const getCenterIconSVG = (type: MedicalCenter['type']) => {
  switch (type) {
    case 'hospital':
      return `
            <svg id="svg" fill="#ffffff" stroke="#ffffff" width="200" height="200" version="1.1" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg">
                <g id="IconSvg_bgCarrier" stroke-width="0"></g>
                <g id="IconSvg_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0">
                  <g xmlns="http://www.w3.org/2000/svg">
              <path d="m387.25 318.7h25.473v-26.055h26.055v-25.453h-26.055v-26.047h-25.473v26.047h-26.039v25.453h26.039z"></path>
              <path d="m194.91 374.52v195.39c0 14.652 11.891 26.531 26.551 26.531h41.191v-248.45h-41.199c-14.66 0-26.543 11.879-26.543 26.531z"></path>
              <path d="m578.57 347.98h-41.211v248.44h41.211c14.641 0 26.531-11.879 26.531-26.531l-0.003906-195.38c-0.007812-14.652-11.887-26.531-26.527-26.531z"></path>
              <path d="m476.3 275.53h-0.17969c-2.3086-40.055-35.5-71.965-76.125-71.965-40.629 0-73.84 31.91-76.145 71.965h-0.20312c-21.473 0-38.863 17.41-38.863 38.875v282.01h70.332v-80.598c0-24.789 20.07-44.871 44.871-44.871 24.777 0 44.848 20.082 44.848 44.871v80.598h70.332l-0.003906-282c0.03125-21.473-17.371-38.883-38.863-38.883zm-76.297-48.777c29.301 0 53.172 23.852 53.172 53.172s-23.871 53.172-53.172 53.172c-29.32 0-53.191-23.852-53.191-53.172 0-29.324 23.871-53.172 53.191-53.172zm-24.523 224.27h-48.195v-33.23h48.195zm0-59.812h-48.195v-33.23h48.195zm97.223 59.812h-48.195v-33.23h48.195zm0-59.812h-48.195l0.003906-33.23h48.195z"></path>
              </g>
            </svg>
      `;
    case 'clinic':
      return `

          <svg id="svg" fill="#ffffff" stroke="#ffffff" width="200" height="200" version="1.1" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg">
            <g id="IconSvg_bgCarrier" stroke-width="0"></g>
            <g id="IconSvg_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0">
              <g xmlns="http://www.w3.org/2000/svg">
          <path d="m438.41 573.18h-76.832c-4.3477 0-7.8711-3.5234-7.8711-7.8711v-40.305h-40.305c-4.3477 0-7.8711-3.5273-7.8711-7.875v-76.828c0-4.3477 3.5234-7.875 7.8711-7.875h40.305v-40.305c0-4.3477 3.5234-7.8711 7.8711-7.8711h76.832c2.0859 0 4.0898 0.82812 5.5664 2.3047 1.4766 1.4766 2.3047 3.4805 2.3047 5.5664v40.305h40.305c2.0898 0 4.0898 0.83203 5.5664 2.3086 1.4766 1.4766 2.3047 3.4766 2.3047 5.5664v76.832-0.003907c0 2.0898-0.82813 4.0898-2.3047 5.5664-1.4766 1.4766-3.4766 2.3086-5.5664 2.3086h-40.305v40.305c0 2.0859-0.82812 4.0898-2.3047 5.5664-1.4766 1.4766-3.4805 2.3047-5.5664 2.3047zm-68.957-15.742h61.086v-40.309c0-4.3477 3.5234-7.8711 7.8711-7.8711h40.305v-61.086h-40.305c-4.3477 0-7.8711-3.5234-7.8711-7.8711v-40.305h-61.09v40.305c0 2.0859-0.82812 4.0898-2.3047 5.5664-1.4766 1.4766-3.4766 2.3047-5.5664 2.3047h-40.305v61.086h40.305c2.0898 0 4.0898 0.82812 5.5664 2.3047 1.4766 1.4766 2.3047 3.4805 2.3047 5.5664z"></path>
          <path d="m541.7 628.29h-283.39c-4.3477 0-7.8711-3.5273-7.8711-7.875v-283.39c0-4.3477 3.5234-7.875 7.8711-7.875h283.39c2.0859 0 4.0898 0.83203 5.5664 2.3086 1.4766 1.4766 2.3047 3.4766 2.3047 5.5664v283.39c0 2.0898-0.82812 4.0898-2.3047 5.5664-1.4766 1.4766-3.4805 2.3086-5.5664 2.3086zm-275.52-15.746h267.65v-267.65h-267.65z"></path>
          <path d="m620.41 344.89h-440.83c-3.4023-0.023437-6.4062-2.2305-7.4453-5.4688-1.0391-3.2422 0.12109-6.7852 2.8789-8.7812l220.42-157.44v0.003906c2.7305-1.9492 6.3984-1.9492 9.1289 0l220.42 157.44v-0.003907c2.7578 1.9961 3.918 5.5391 2.8828 8.7812-1.0391 3.2383-4.043 5.4453-7.4492 5.4688zm-416.27-15.746h391.71l-195.86-139.88z"></path>
          </g>
        </svg>
      `;
    case 'health_center':
      return `
      <svg id="svg" fill="#ffffff" stroke="#ffffff" width="200" height="200" version="1.1" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg">
    <g id="IconSvg_bgCarrier" stroke-width="0"></g>
    <g id="IconSvg_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0">
      <g xmlns="http://www.w3.org/2000/svg">
  <path d="m198.48 198.48v75.57h37.785v327.48h327.48v-327.48h37.785v-75.57zm234.27 392.97h-65.496v-130.99h65.496zm120.91 0h-110.84l0.003907-141.07h-85.648v141.07h-110.84v-317.4h307.32zm37.785-327.48h-382.89v-55.418h382.89z"></path>
  <path d="m326.95 298.83h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m326.95 369.62h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m326.95 440.45h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m326.95 511.24h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m528.47 298.83h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m528.47 369.62h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m528.47 440.45h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m528.47 511.24h-55.418v55.418h55.418zm-10.074 45.344h-35.266v-35.266h35.266z"></path>
  <path d="m382.36 404.79h35.266v-25.191h25.191v-35.266h-25.191v-25.191h-35.266v25.191h-25.191v35.266h25.191zm-15.113-35.266v-15.113h25.191v-25.191h15.113v25.191h25.191v15.113h-25.191v25.191h-15.113v-25.191z"></path>
 </g>

      </svg>
      `;
    default:
      return `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="18" height="16" rx="2"/>
          <path d="M12 8V16M8 12H16" stroke="#6B7280" stroke-width="2" stroke-linecap="round"/>
        </svg>
      `;
  }
};

export const getUserLocationIconSVG = () => {
  return `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
      <circle cx="12" cy="12" r="2" fill="#3B82F6"/>
    </svg>
  `;
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} metros`;
  }
  return `${distance.toFixed(2)} km`;
};

export const formatDuration = (durationInMinutes: number): string => {
  if (durationInMinutes < 60) {
    return `${Math.round(durationInMinutes)} min`;
  }
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = Math.round(durationInMinutes % 60);
  return `${hours}h ${minutes}min`;
};