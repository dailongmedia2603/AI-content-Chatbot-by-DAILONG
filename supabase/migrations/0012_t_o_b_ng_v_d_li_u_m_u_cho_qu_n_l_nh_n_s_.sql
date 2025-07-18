-- Create staff table
CREATE TABLE public.staff (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Policies for staff table
CREATE POLICY "Allow authenticated users to manage staff" ON public.staff
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert sample staff data
INSERT INTO public.staff (name, role, email, avatar_url, status) VALUES
('Nguyễn Văn An', 'Quản lý dự án', 'an.nguyen@example.com', 'https://i.pravatar.cc/150?u=an.nguyen', 'active'),
('Trần Thị Bích', 'Nhà phát triển Frontend', 'bich.tran@example.com', 'https://i.pravatar.cc/150?u=bich.tran', 'active'),
('Lê Minh Cường', 'Thiết kế UI/UX', 'cuong.le@example.com', 'https://i.pravatar.cc/150?u=cuong.le', 'active'),
('Phạm Thị Dung', 'Kiểm thử viên', 'dung.pham@example.com', 'https://i.pravatar.cc/150?u=dung.pham', 'inactive'),
('Hoàng Văn E', 'Nhà phát triển Backend', 'e.hoang@example.com', 'https://i.pravatar.cc/150?u=e.hoang', 'active');