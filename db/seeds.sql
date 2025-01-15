INSERT INTO department (id, name)
VALUES (001, Editorial),
       (002, Design/Layout),
       (003, Marketing),
       (004, Sales);

INSERT INTO role (id, title, salary, departemnt_id)
VALUES (001, Editor in Chief, 120000, 001),
       (002, Copy Editor, 50000, 001),
       (003, Graphic Designer, 60000, 002),
       (004, Marketing Manager, 70000, 003),
       (005, Sales Manager, 80000, 004),
       (006, Sales Associate, 40000, 004),
       (007, Marketing Associate, 40000, 003),
       (008, Creative Director, 100000, 002);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (001, Ben, Thompson, 001, 002),
       (002, Jane, Ellerby, 002, NULL),
       (003, Jose, Garcia, 003, NULL),
       (004, Mary, Faustin, 004, 007),
       (005, Skip, Williams, 005, 006),
       (006, Sarah, Brown, 006, NULL),
       (007, Tarik, Davis, 007, NULL),
       (008, Laura, Martinez, 008, 003);