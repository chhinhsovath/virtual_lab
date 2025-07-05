-- Add a sample teacher to the system
INSERT INTO tbl_teacher_information (
  teiteacherid,
  teiname,
  teinamekh,
  teigender,
  teiphone,
  teiemail,
  teischoolid
) VALUES (
  'TCH001',
  'Sample Teacher',
  'គ្រូគំរូ',
  'Female',
  '012345678',
  'teacher@example.com',
  (SELECT sclautoid FROM tbl_school_list LIMIT 1)
) ON CONFLICT (teiteacherid) DO NOTHING;