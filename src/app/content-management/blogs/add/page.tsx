import BlogForm from "../BlogForm";

const ADD_CONTENT_BLOCK = -1;

const Page = () => {
  return <BlogForm open={ADD_CONTENT_BLOCK} />;
};

export default Page;
