import React from 'react';

const Community = () => {
  return (
    <section className="py-5">
      <div className="container text-center">
        <div className="row">
          <div className="col-md-6">
            <img src="https://via.placeholder.com/600x400?text=Church+Interior" className="img-fluid community-img rounded" alt="Church Interior" />
          </div>
          <div className="col-md-6">
            <img src="https://via.placeholder.com/600x400?text=Mass+Celebration" className="img-fluid community-img rounded" alt="Mass" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="fw-bold">A Community of Faith, Hope, and Love</h3>
          <p>At Awakenur, we welcome everyone to experience God's love and grow in faith. Join us in worship, community support, and service as we walk this spiritual journey together.</p>
        </div>
      </div>
    </section>
  );
};

export default Community;