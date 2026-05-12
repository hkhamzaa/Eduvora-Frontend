import { useGetUsersAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import { useGetRecommendationsQuery } from "@/redux/features/neo4j/neo4jApi";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CourseCard from "../Course/CourseCard";

type Props = {};

const Courses = () => {
  const { data } = useGetUsersAllCoursesQuery({});
  const [courses, setCourses] = useState<any[]>([]);

  const { user } = useSelector((state: any) => state.auth);

  // Skip the API call entirely when no one is logged in (route requires auth)
  const { data: recData } = useGetRecommendationsQuery(undefined, {
    skip: !user,
  });
  const recommendedCourses: any[] = recData?.courses ?? [];

  useEffect(() => {
    setCourses(data?.courses);
  }, [data]);

  return (
    <div>
      {/* ── All Courses ─────────────────────────────────────────────── */}
      <div className={`w-[90%] 800px:w-[80%] m-auto`}>
        <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:!leading-[60px] text-[#000] font-[700] tracking-tight">
          Expand Your Career <span className="text-gradient">Opportunity</span>{" "}
          <br />
          Opportunity With Our Courses
        </h1>
        <br />
        <br />
        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
          {courses &&
            courses.map((item: any, index: number) => (
              <CourseCard item={item} key={index} />
            ))}
        </div>
      </div>

      {/* ── Recommended For You — only rendered for logged-in users ──── */}
      {user && recommendedCourses.length > 0 && (
        <div className={`w-[90%] 800px:w-[80%] m-auto mt-10`}>
          <h1 className="text-center font-Poppins text-[25px] leading-[35px] sm:text-3xl lg:text-4xl dark:text-white 800px:!leading-[60px] text-[#000] font-[700] tracking-tight">
            Recommended <span className="text-gradient">For You</span>
          </h1>
          <br />
          <br />
          <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] 1500px:grid-cols-4 1500px:gap-[35px] mb-12 border-0">
            {recommendedCourses.map((item: any, index: number) => (
              <CourseCard item={item} key={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
