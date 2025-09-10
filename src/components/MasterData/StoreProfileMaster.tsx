import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ToastProvider } from '../common/ToastNotification';
import GenericMasterData, { GenericMasterItem, MasterDataConfig } from './GenericMasterData';
import Header from '../Layout/Header/Header';
import AppSidebar from '../Layout/Sidebar/Sidebar';

export interface StoreProfileItem extends GenericMasterItem {
    no?: number;
    storeCode: string;
    costCenter: string;
    storeNameEn: string;
    storeNameTh: string | null;
    goDate: string;
    format: string;
    region: string;
    closeDate?: string;
    status?: string;
}

const regionalOptions = [
    'Hyper North',
    'Hyper South',
    'Hyper Central',
    'Hyper East',
    'Hyper West',
    'Hyper Northeast',
    'Mini North',
    'Mini South',
    'Mini Central',
    'Mini East',
    'Mini West',
    'Mini Northeast',
    'CPFM North',
    'CPFM South',
    'CPFM Central',
    'CPFM East',
    'CPFM West',
    'CPFM Northeast',
    'Supermarket North',
    'Supermarket South',
    'Supermarket Central',
    'Supermarket East',
    'Supermarket West',
    'Supermarket Northeast',
    'Mall North',
    'Mall South',
    'Mall Central',
    'Mall East',
    'Mall West',
    'Mall Northeast',
];

const initialData: StoreProfileItem[] = [
  {
    "id": "1",
    "no": 1,
    "storeCode": "5020",
    "costCenter": "10070",
    "storeNameEn": "Rama 4",
    "storeNameTh": "พระราม 4",
    "goDate": "2000-04-23",
    "format": "Hypermarket",
    "region": "Hyper South",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-15 10:30:00",
    "updateBy": "admin",
    "isActive": true
  },
  {
    "id": "2",
    "no": 2,
    "storeCode": "5098",
    "costCenter": "10148",
    "storeNameEn": "Khon Kaen2",
    "storeNameTh": "ขอนแก่น 2",
    "goDate": "2011-12-02",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-14 14:20:00",
    "updateBy": "user1",
    "isActive": true
  },
  {
    "id": "3",
    "no": 3,
    "storeCode": "5032",
    "costCenter": "10082",
    "storeNameEn": "Bang Na (9K)",
    "storeNameTh": "บางนา-ตราด",
    "goDate": "2001-11-01",
    "format": "Hypermarket",
    "region": "Hyper South",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-13 09:15:00",
    "updateBy": "system",
    "isActive": true
  },
  {
    "id": "4",
    "no": 4,
    "storeCode": "5026",
    "costCenter": "10076",
    "storeNameEn": "Ubon Ratchathani",
    "storeNameTh": "อุบลราชธานี",
    "goDate": "2001-02-08",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-12 16:45:00",
    "updateBy": "admin",
    "isActive": true
  },
  {
    "id": "5",
    "no": 5,
    "storeCode": "5060",
    "costCenter": "10110",
    "storeNameEn": "Navanakorn",
    "storeNameTh": "นวนคร",
    "goDate": "2007-03-30",
    "format": "Hypermarket",
    "region": "Hyper South",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-11 11:25:00",
    "updateBy": "user1",
    "isActive": true
  },
  {
    "id": "6",
    "no": 6,
    "storeCode": "5110",
    "costCenter": "10160",
    "storeNameEn": "Phitsanulok 2, Extra (PSL2)",
    "storeNameTh": null,
    "goDate": "2012-12-28",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-10 08:50:00",
    "updateBy": "system",
    "isActive": true
  },
  {
    "id": "7",
    "no": 7,
    "storeCode": "5111",
    "costCenter": "10161",
    "storeNameEn": "Maesod",
    "storeNameTh": "แม่สอด",
    "goDate": "2013-01-11",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-09 15:30:00",
    "updateBy": "admin",
    "isActive": true
  },
  {
    "id": "8",
    "no": 8,
    "storeCode": "5018",
    "costCenter": "10068",
    "storeNameEn": "Ramintra",
    "storeNameTh": "รามอินทรา",
    "goDate": "2000-02-18",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-08 13:15:00",
    "updateBy": "user1",
    "isActive": true
  },
  {
    "id": "9",
    "no": 9,
    "storeCode": "5029",
    "costCenter": "10079",
    "storeNameEn": "Udonthani",
    "storeNameTh": "อุดรธานี",
    "goDate": "2001-08-29",
    "format": "Hypermarket",
    "region": "Hyper North",
    "closeDate": "",
    "status": "ACTIVE",
    "lastUpdate": "2024-12-07 17:40:00",
    "updateBy": "system",
    "isActive": true
  }
];

function StoreProfileMaster() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleMobileClose = () => {
        setMobileOpen(false);
    };

    const config: MasterDataConfig<StoreProfileItem> = {
        title: "Store Profile Master",
        fields: [
            { key: 'no', label: 'No.', width: 80, editable: false },
            { key: 'storeCode', label: 'Store Code', required: true, placeholder: 'กรุณาใส่รหัสสาขา' },
            { key: 'costCenter', label: 'Cost Centre', required: true, placeholder: 'กรุณาใส่ต้นทุนศูนย์' },
            { key: 'storeNameEn', label: 'Store Name (EN)', required: true, placeholder: 'กรุณาใส่ชื่อสาขา (อังกฤษ)' },
            { key: 'storeNameTh', label: 'Store Name (TH)', placeholder: 'กรุณาใส่ชื่อสาขา (ไทย)' },
            { key: 'goDate', label: 'Go Date', placeholder: 'YYYY-MM-DD' },
            { key: 'format', label: 'Format', placeholder: 'กรุณาใส่รูปแบบสาขา' },
            { key: 'region', label: 'Region', type: 'select', options: regionalOptions.map(option => ({ value: option, label: option })) },
            { key: 'closeDate', label: 'Close Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'select', options: [
                { value: 'ACTIVE', label: 'ACTIVE' },
                { value: 'INACTIVE', label: 'INACTIVE' }
            ], editable: false },
        ],
        initialData,
       validation: {
            storeCode: (value) => !value?.trim() ? 'กรุณาระบุ Store Code' : null,
            storeNameEn: (value) => !value?.trim() ? 'กรุณาระบุ Store Name (EN)' : null,
        },
        duplicateCheck: (item, rows) => {
            return rows.some(r => 
                r.storeCode === item.storeCode && 
                r.costCenter === item.costCenter &&
                r.id !== item.id
            );
        },
        storageKey: 'store_profile_master'
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppSidebar 
                collapsed={sidebarCollapsed}
                isMobile={false}
                mobileOpen={mobileOpen}
                onMobileClose={handleMobileClose}
            />
            <Box 
                component="main" 
                sx={{ 
                    width: sidebarCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)',
                    position: 'absolute',
                    left: sidebarCollapsed ? '60px' : '240px',
                    top: 0,
                    transition: 'width 0.3s ease, left 0.3s ease',
                    minHeight: '100vh'
                }}
            >
                <Header 
                    onToggleSidebar={handleToggleSidebar}
                    collapsed={sidebarCollapsed}
                    isMobile={false}
                />
                <Box sx={{ pt: 5 }}>
                    <GenericMasterData config={config} />
                </Box>
            </Box>
        </Box>
    );
}

const StoreProfileMasterWithToast = () => (
    <ToastProvider>
        <StoreProfileMaster />
    </ToastProvider>
);

export default StoreProfileMasterWithToast;