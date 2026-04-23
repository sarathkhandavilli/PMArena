DELETE FROM users;

INSERT INTO users (id, email, role, tenant_id)
VALUES
  (
    'd533e04f-205c-437d-b65f-84d034bde88b',
    'sarathchandra251@gmail.com',
    'SUPER_ADMIN',
    NULL
  ),
  (
    'f52a7097-d60e-436c-b0b4-4d8266d296fd',
    'sarathchandra573@gmail.com',
    'ADMIN',
    NULL
  ),
  (
    '0907718e-d89e-4792-aa11-d84b9dfc435a',
    'iamsarath999@gmail.com',
    'SUPER_ADMIN',
    NULL
  );
