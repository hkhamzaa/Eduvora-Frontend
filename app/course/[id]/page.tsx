'use client'
import React, { use } from "react";
import CourseDetailsPage from "../../components/Course/CourseDetailsPage";


const Page = ({params}:any) => {
    const resolvedParams = use(params);
    return (
        <div>
            <CourseDetailsPage id={resolvedParams.id} />
        </div>
    )
}

export default Page;
 