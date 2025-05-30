import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LottiePic from "../animate/lottie4";
import Loadingg from "../animate/loading";

const Userappointments = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/signin');
          return;
        }
        const res = await axios.get(`https://devops-1-4e4p.onrender.com/api/bookings/client`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          navigate('/signin');
        } else {
          setError(err.response?.data?.message || 'Error fetching bookings');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [id, navigate]);

  const handlePaymentRedirect = (bookingId, price) => {
    navigate(`/payment/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loadingg />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-900 to-white">
      <div className='container mx-auto px-4 py-8'>
        <h2 className="text-5xl font-bold mb-8 text-white">Your Appointments</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div className='hidden md:block'>
            <div className='sticky top-8'>
              <LottiePic />
            </div>
          </div>

          <div className='space-y-6'>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="text-center text-gray-600 bg-white p-6 rounded-lg shadow">
                No appointments found.
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div 
                    key={booking._id} 
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6"
                  >
                    <h3 className="text-xl font-semibold mb-3 text-sky-900">
                      Performer: {booking.performerName || "Unknown"}
                    </h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {booking.time}</p>
                      <p><strong>Location:</strong> {booking.location}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          booking.status === "Confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {booking.status || "Pending"}
                        </span>
                      </p>
                      <p><strong>Payment:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${
                          booking.paymentStatus === "Paid" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {booking.paymentStatus || "Unpaid"}
                        </span>
                      </p>
                    </div>

                    {booking.status === "Confirmed" && booking.paymentStatus !== "Paid" && (
                      <button
                        onClick={() => handlePaymentRedirect(booking._id, booking.pricing)}
                        className="mt-4 bg-sky-900 hover:bg-sky-800 text-white px-6 py-2 rounded-lg transition-colors duration-300"
                      >
                        Make Payment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Userappointments;
